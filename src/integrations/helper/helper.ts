import axios from "axios";

/**
 * Sends a cancellation request to the Kualitee API for a specific execution cycle.
 * @param body The main request payload containing base_URL, token, project_id, and cycle_id.
 */
export const cancelCucumberKualiteeExecution = async (body: any): Promise<void> => {
    const base_url = body.base_URL;
    const cancelEndPoint = `${base_url}cycle/cancel_execution`;

    let payload = {
        cycle_id: body.cycle_id,
        project_id: body.project_id
    }

    try {
        await axios.post(cancelEndPoint, payload, {
            headers: {
                "content-type": "multipart/form-data",
                'Token': `${body.token}`,
                'user-agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36`
            }
        });

        console.log(`[Kualitee Emergency] Execution successfully cancelled.`);
    } catch (cancelError: any) {
        console.error(`[Kualitee Emergency Error] Failed to send cancellation request:`, cancelError.message);
    }
};