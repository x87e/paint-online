(function (global) {
  const GIF_MIME_TYPE = "image/gif";
  const MAX_GIF_DIMENSION = 65535;
  const PALETTE_SIZE = 256;
  const LZW_MINIMUM_CODE_SIZE = 8;
  const LZW_CLEAR_CODE = 1 << LZW_MINIMUM_CODE_SIZE;
  const LZW_END_CODE = LZW_CLEAR_CODE + 1;
  const LZW_MAX_CODE = 4095;

  const redAndGreenLevels = Uint8Array.from(
    { length: 256 },
    (_, value) => Math.min(7, Math.round((value * 7) / 255))
  );
  const blueLevels = Uint8Array.from(
    { length: 256 },
    (_, value) => Math.min(3, Math.round((value * 3) / 255))
  );

  function createPalette() {
    const palette = new Uint8Array(PALETTE_SIZE * 3);
    for (let index = 0; index < PALETTE_SIZE; index += 1) {
      const red = (index >> 5) & 0x07;
      const green = (index >> 2) & 0x07;
      const blue = index & 0x03;
      const offset = index * 3;
      palette[offset] = Math.round((red * 255) / 7);
      palette[offset + 1] = Math.round((green * 255) / 7);
      palette[offset + 2] = Math.round((blue * 255) / 3);
    }
    return palette;
  }

  const globalPalette = createPalette();

  function yieldToBrowser() {
    return new Promise((resolve) => global.setTimeout(resolve, 0));
  }

  function validatedImageData(imageData) {
    const width = Number(imageData && imageData.width);
    const height = Number(imageData && imageData.height);
    const data = imageData && imageData.data;
    if (
      !Number.isInteger(width)
      || !Number.isInteger(height)
      || width < 1
      || height < 1
      || width > MAX_GIF_DIMENSION
      || height > MAX_GIF_DIMENSION
      || !data
      || data.length < width * height * 4
    ) {
      throw new Error("GIF image data is invalid");
    }
    return { width, height, data };
  }

  async function quantiseImageData(imageData, shouldYield) {
    const { width, height, data } = validatedImageData(imageData);
    const indices = new Uint8Array(width * height);
    let pixelIndex = 0;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = pixelIndex * 4;
        const alpha = data[offset + 3];
        let red = data[offset];
        let green = data[offset + 1];
        let blue = data[offset + 2];

        if (alpha < 255) {
          red = 255 - Math.round(((255 - red) * alpha) / 255);
          green = 255 - Math.round(((255 - green) * alpha) / 255);
          blue = 255 - Math.round(((255 - blue) * alpha) / 255);
        }

        indices[pixelIndex] = (
          (redAndGreenLevels[red] << 5)
          | (redAndGreenLevels[green] << 2)
          | blueLevels[blue]
        );
        pixelIndex += 1;
      }

      if (shouldYield && y > 0 && y % 64 === 0) {
        await yieldToBrowser();
      }
    }

    return { width, height, indices };
  }

  function createGrowingByteBuffer(initialCapacity) {
    let bytes = new Uint8Array(Math.max(1024, initialCapacity));
    let length = 0;

    return {
      push(value) {
        if (length >= bytes.length) {
          const expanded = new Uint8Array(Math.ceil(bytes.length * 1.5));
          expanded.set(bytes);
          bytes = expanded;
        }
        bytes[length] = value & 0xff;
        length += 1;
      },
      finish() {
        return bytes.slice(0, length);
      }
    };
  }

  async function compressPixelIndices(indices, shouldYield) {
    const output = createGrowingByteBuffer(Math.ceil(indices.length * 1.51) + 1024);
    const dictionary = new Map();
    let bitBuffer = 0;
    let bitCount = 0;
    let codeSize = LZW_MINIMUM_CODE_SIZE + 1;
    let nextCode = LZW_END_CODE + 1;

    const writeCode = (code) => {
      bitBuffer |= code << bitCount;
      bitCount += codeSize;
      while (bitCount >= 8) {
        output.push(bitBuffer & 0xff);
        bitBuffer >>>= 8;
        bitCount -= 8;
      }
    };

    const resetDictionary = () => {
      dictionary.clear();
      codeSize = LZW_MINIMUM_CODE_SIZE + 1;
      nextCode = LZW_END_CODE + 1;
    };

    writeCode(LZW_CLEAR_CODE);
    let prefix = indices[0];

    for (let index = 1; index < indices.length; index += 1) {
      const suffix = indices[index];
      const dictionaryKey = prefix * PALETTE_SIZE + suffix;
      const existingCode = dictionary.get(dictionaryKey);

      if (existingCode !== undefined) {
        prefix = existingCode;
      } else {
        writeCode(prefix);
        if (nextCode <= LZW_MAX_CODE) {
          dictionary.set(dictionaryKey, nextCode);
          nextCode += 1;
          if (nextCode > (1 << codeSize) && codeSize < 12) {
            codeSize += 1;
          }
        } else {
          writeCode(LZW_CLEAR_CODE);
          resetDictionary();
        }
        prefix = suffix;
      }

      if (shouldYield && index > 0 && index % 262144 === 0) {
        await yieldToBrowser();
      }
    }

    writeCode(prefix);
    writeCode(LZW_END_CODE);
    if (bitCount > 0) {
      output.push(bitBuffer & 0xff);
    }
    return output.finish();
  }

  function littleEndian16(value) {
    return [value & 0xff, (value >> 8) & 0xff];
  }

  function imageDataBlocks(compressedData) {
    const blockCount = Math.ceil(compressedData.length / 255);
    const blocks = new Uint8Array(compressedData.length + blockCount + 1);
    let sourceOffset = 0;
    let outputOffset = 0;

    while (sourceOffset < compressedData.length) {
      const blockLength = Math.min(255, compressedData.length - sourceOffset);
      blocks[outputOffset] = blockLength;
      outputOffset += 1;
      blocks.set(
        compressedData.subarray(sourceOffset, sourceOffset + blockLength),
        outputOffset
      );
      sourceOffset += blockLength;
      outputOffset += blockLength;
    }

    blocks[outputOffset] = 0;
    return blocks;
  }

  async function encodeImageData(imageData, options) {
    const shouldYield = (!options || options.yield !== false)
      && typeof global.document !== "undefined";
    const { width, height, indices } = await quantiseImageData(imageData, shouldYield);
    const compressedData = await compressPixelIndices(indices, shouldYield);
    const headerAndScreen = Uint8Array.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61,
      ...littleEndian16(width),
      ...littleEndian16(height),
      0xf7,
      0xff,
      0x00
    ]);
    const imageDescriptor = Uint8Array.from([
      0x2c,
      0x00, 0x00,
      0x00, 0x00,
      ...littleEndian16(width),
      ...littleEndian16(height),
      0x00
    ]);

    return new Blob([
      headerAndScreen,
      globalPalette,
      imageDescriptor,
      Uint8Array.of(LZW_MINIMUM_CODE_SIZE),
      imageDataBlocks(compressedData),
      Uint8Array.of(0x3b)
    ], { type: GIF_MIME_TYPE });
  }

  async function encodeCanvas(sourceCanvas) {
    const context = sourceCanvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("GIF canvas could not be read");
    }
    const imageData = context.getImageData(
      0,
      0,
      sourceCanvas.width,
      sourceCanvas.height
    );
    return encodeImageData(imageData);
  }

  global.PaintGifEncoder = Object.freeze({
    encodeCanvas,
    encodeImageData
  });
}(typeof window === "undefined" ? globalThis : window));
