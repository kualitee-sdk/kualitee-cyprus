import fs from "fs";
import path from "path";
import axios from "axios";

interface Attachment {
    file_name: string;
    signed_url: string;
    target_path: string; // We will inject this dynamically from the payload parent
}

export const writeFilesFromAttachments = async (payload: any): Promise<void> => {
    const attachmentsToProcess: Attachment[] = [];

    // 1. Collect feature files if they exist
    if (payload.feature_files && payload.featureFile_path) {
        for (const file of payload.feature_files) {
            attachmentsToProcess.push({
                file_name: file.file_name,
                signed_url: file.signed_url,
                target_path: path.join(payload.featureFile_path, file.file_name)
            });
        }
    }

    // 2. Collect step definition files if they exist
    if (payload.step_definitions && payload.stepDef_path) {
        for (const file of payload.step_definitions) {
            attachmentsToProcess.push({
                file_name: file.file_name,
                signed_url: file.signed_url,
                target_path: path.join(payload.stepDef_path, file.file_name)
            });
        }
    }

    // 3. Collect page files if they exist
    if (payload.page && payload.page_path) {
        for (const file of payload.page) {
            attachmentsToProcess.push({
                file_name: file.file_name,
                signed_url: file.signed_url,
                target_path: path.join(payload.page_path, file.file_name)
            });
        }
    }

    // 4. Run your original, preferred download loop
    for (const attachment of attachmentsToProcess) {
        const { file_name, signed_url, target_path } = attachment;

        if (!signed_url || !target_path) {
            throw new Error(`Missing signed_url or target_path for file: ${file_name || "Unknown"}`);
        }

        const resolvedPath = path.resolve(target_path);
        const dir = path.dirname(resolvedPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        console.log(`[Downloading] ${file_name} -> ${resolvedPath}`);

        const response = await axios({
            method: "GET",
            url: signed_url,
            responseType: "stream"
        });

        await new Promise<void>((resolve, reject) => {
            const writer = fs.createWriteStream(resolvedPath);
            response.data.pipe(writer);

            writer.on("finish", () => {
                console.log(`[Success] Created: ${file_name} on ${resolvedPath}`);
                resolve();
            });

            writer.on("error", (err) => {
                writer.close();
                reject(err);
            });
        });
    }
};