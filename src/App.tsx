import React, { useEffect, useState } from "react";
import qrcode from "qrcode";
import "./App.css";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [qrCodes, setQrCodes] = useState<string[]>([]);
  const [currentQR, setCurrentQR] = useState<number>(0);

  useEffect(() => {
    if (qrCodes.length === 0) return;

    const interval = setInterval(() => {
      setCurrentQR((prev) => (prev + 1) % qrCodes.length);
    }, 100);

    return () => clearInterval(interval);
  }, [qrCodes]);

  interface FilePacket {
    fileId: string;
    fileName: string;
    fileType: string;
    chunkIndex: number;
    totalChunks: number;
    data: string;
  }

  const creatPacket = (
    file: File,
    fileId: string,
    chunkIndex: number,
    totalChunks: number,
    data: Uint8Array,
  ): FilePacket => {
    return {
      fileId,
      fileName: file.name,
      fileType: file.type,
      chunkIndex,
      totalChunks,
      data: Unit8ArrayToBase64(data),
    };
  };

  const readFile = async (file: File): Promise<ArrayBuffer> => {
    const data = await file.arrayBuffer();

    return data;
  };

  const converToBytes = (data: ArrayBuffer): Uint8Array => {
    return new Uint8Array(data);
  };

  const createChunks = (data: Uint8Array, size: number): Uint8Array[] => {
    const chunks: Uint8Array[] = [];
    for (let i = 0; i < data.length; i += size) {
      const chunk = data.slice(i, i + size);
      chunks.push(chunk);
    }
    return chunks;
  };

  const Unit8ArrayToBase64 = (bytes: Uint8Array): string => {
    let binary = "";

    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    return btoa(binary);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      setFile(selectedFile);
      const data = await readFile(selectedFile);
      console.log("Data Buffer : ", data);

      const bytes = converToBytes(data);
      console.log("Unit 8 Array : ", bytes);

      const chunksArray = createChunks(bytes, 1500);
      console.log("Chunks Array : ", chunksArray);

      const fileId = crypto.randomUUID();

      const packets: FilePacket[] = [];
      for (let i = 0; i < chunksArray.length; i++) {
        const packet = creatPacket(
          selectedFile,
          fileId,
          i,
          chunksArray.length,
          chunksArray[i],
        );
        packets.push(packet);
      }
      console.log("Packets Array : ", packets);

      const qrCodeArray: string[] = [];
      for (let i = 0; i < packets.length; i++) {
        let jsonData = JSON.stringify(packets[i]);
        console.log(jsonData);
        console.log(i);

        const qr = await qrcode.toDataURL(jsonData).then((url) => {
          qrCodeArray.push(url);
        });
      }
      setQrCodes(qrCodeArray);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {file && (
        <div>
          <h1>ByteBeam</h1>
          <input type="file" onChange={handleFileChange} />
          <h3>File Name : {file.name}</h3>
          <h3>File Size : {file.size} Bytes</h3>
          <h3>File Type : {file.type}</h3>
        </div>
      )}

      <div>
        {qrCodes.length > 0 && (
          <img src={qrCodes[currentQR]} alt="qr" width={500} />
        )}
      </div>
    </div>
  );
}

export default App;
