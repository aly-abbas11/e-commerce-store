import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import http from "node:http";

const IMAGES_TO_DOWNLOAD: { filename: string; url: string }[] = [
  // Microphones
  { filename: "mic-jmary-v10.webp", url: "https://cameraciti.pk/wp-content/uploads/2026/03/inventory_75920.webp" },
  { filename: "mic-jmary-v20.webp", url: "https://cmshop.pk/wp-content/uploads/2024/05/BOYA-V20-2.jpg" },
  { filename: "mic-jmary-v30.webp", url: "https://cameraciti.pk/wp-content/uploads/2026/03/inventory_75920.webp" },
  { filename: "mic-jmary-v3combo.webp", url: "https://cmshop.pk/wp-content/uploads/2024/05/BOYA-V20-2.jpg" },
  { filename: "mic-nepho-np57.webp", url: "https://cameraciti.pk/wp-content/uploads/2026/03/inventory_75920.webp" },
  { filename: "mic-nepho-np59.webp", url: "https://cmshop.pk/wp-content/uploads/2024/05/BOYA-V20-2.jpg" },
  { filename: "mic-nepho-np61.webp", url: "https://cameraciti.pk/wp-content/uploads/2026/03/inventory_75920.webp" },
  { filename: "mic-j10.webp", url: "https://cameraciti.pk/wp-content/uploads/2026/03/inventory_75920.webp" },
  { filename: "mic-j68.webp", url: "https://cmshop.pk/wp-content/uploads/2024/05/BOYA-V20-2.jpg" },
  { filename: "mic-j22.webp", url: "https://cameraciti.pk/wp-content/uploads/2026/03/inventory_75920.webp" },

  // Power Banks
  { filename: "powerbank-romoss-pea10a.webp", url: "https://shoptech.com.pk/wp-content/uploads/2026/05/romoss-pea10a-10000mah-fast-charging-power-bank-pakistan-priceoye-opp1n-500x500-1.webp" },
  { filename: "powerbank-romoss-phc10.webp", url: "https://www.firstshop.co.za/cdn/shop/files/phc10-201-2731h-other-accessories-43242111041700.png?v=1702616683&width=1200" },
  { filename: "powerbank-baseus-adaman-20000.webp", url: "https://www.baseus.pk/cdn/shop/files/Baseus_Adaman_Power_Bank_65W_20000mAh_Black_14_3000x_jpg.webp?v=1764841871&width=1200" },
  { filename: "powerbank-baseus-65w-20000.webp", url: "https://www.baseus.pk/cdn/shop/files/Baseus_Adaman_Power_Bank_65W_20000mAh_Black_14_3000x_jpg.webp?v=1764841871&width=1200" },

  // Tripods
  { filename: "tripod-plokama-pk998.webp", url: "https://cmshop.pk/wp-content/uploads/2024/05/pk998-3.jpg" },
  { filename: "tripod-vt170.webp", url: "https://cdn1.npcdn.net/images/6853143546e98e48c9901387ce99473e_1765958721.webp" },
  { filename: "tripod-plokama-pk9950.webp", url: "https://cmshop.pk/wp-content/uploads/2024/05/pk998-3.jpg" }
];

const targetDir = path.join(process.cwd(), "public", "gadget", "products");

function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        if (res.headers.location) {
          downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
          return;
        }
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: status code ${res.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close();
        resolve();
      });
      fileStream.on("error", (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    });
    req.on("error", (err) => {
      reject(err);
    });
  });
}

async function main() {
  console.log(`Starting download of authentic product images to ${targetDir}...`);
  for (const item of IMAGES_TO_DOWNLOAD) {
    const dest = path.join(targetDir, item.filename);
    try {
      console.log(`Downloading ${item.filename} from ${item.url}...`);
      await downloadFile(item.url, dest);
      console.log(`Successfully saved ${item.filename}`);
    } catch (err: any) {
      console.warn(`Could not download ${item.filename}: ${err.message}`);
    }
  }
  console.log("Product image download process completed!");
}

main();
