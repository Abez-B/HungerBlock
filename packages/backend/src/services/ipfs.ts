import pinataSDK from "@pinata/sdk";
import { Readable } from "stream";

const PINATA_API_KEY = process.env.PINATA_API_KEY || "";
const PINATA_API_SECRET = process.env.PINATA_API_SECRET || "";
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || "gateway.pinata.cloud";

class IPFSService {
    private pinata: any;

    constructor() {
        this.pinata = new pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);
    }

    /**
     * Upload file to IPFS
     */
    async uploadFile(file: Express.Multer.File) {
        try {
            // Convert buffer to readable stream
            const stream = Readable.from(file.buffer);

            const result = await this.pinata.pinFileToIPFS(stream, {
                pinataMetadata: {
                    name: file.originalname,
                },
            });

            return {
                ipfsHash: result.IpfsHash,
                url: `https://${PINATA_GATEWAY}/ipfs/${result.IpfsHash}`,
            };
        } catch (error) {
            console.error("IPFS upload error:", error);
            throw new Error("Failed to upload to IPFS");
        }
    }

    /**
     * Upload JSON metadata to IPFS
     */
    async uploadJSON(data: any) {
        try {
            const result = await this.pinata.pinJSONToIPFS(data, {
                pinataMetadata: {
                    name: "food-metadata",
                },
            });

            return {
                ipfsHash: result.IpfsHash,
                url: `https://${PINATA_GATEWAY}/ipfs/${result.IpfsHash}`,
            };
        } catch (error) {
            console.error("IPFS JSON upload error:", error);
            throw new Error("Failed to upload JSON to IPFS");
        }
    }

    /**
     * Get file from IPFS
     */
    getUrl(ipfsHash: string): string {
        return `https://${PINATA_GATEWAY}/ipfs/${ipfsHash}`;
    }

    /**
     * Pin existing IPFS hash
     */
    async pinByHash(ipfsHash: string) {
        try {
            await this.pinata.pinByHash(ipfsHash);
            return true;
        } catch (error) {
            console.error("IPFS pinning error:", error);
            return false;
        }
    }
}

export const ipfsService = new IPFSService();
