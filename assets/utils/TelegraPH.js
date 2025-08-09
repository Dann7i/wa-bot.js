import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const TelegraPH = (Path) => 
	new Promise(async (resolve, reject) => {
		if (!fs.existsSync(Path)) return reject(new Error("File not Found"));
		try {
			const form = new FormData();
			form.append("file", fs.createReadStream(Path));
			const { data } = await axios.post("https://telegra.ph/upload", form, {
				headers: {
					...form.getHeaders(),
				},
			});
			return resolve("https://telegra.ph" + data[0].src);
		} catch (err) {
			return reject(new Error(String(err)));
		}
	});
    
export { TelegraPH }