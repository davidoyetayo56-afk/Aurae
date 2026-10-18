const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = process.cwd();
const dist = path.join(root, "dist");
const outputAssets = path.join(dist, "assets");

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function readBase64Parts(folder, count) {
  return Array.from({ length: count }, (_, i) => {
    const name = String(i).padStart(2, "0") + ".txt";
    return fs.readFileSync(path.join(root, "src-assets", folder, name), "utf8").trim();
  }).join("");
}

function writeImage({ folder, parts, filename, bytes, hash }) {
  const encoded = readBase64Parts(folder, parts);
  const data = Buffer.from(encoded, "base64");
  if (data.length !== bytes) {
    throw new Error(`${filename}: decoded ${data.length} bytes; expected ${bytes}. Check the source segments.`);
  }
  const actualHash = sha256(data);
  if (actualHash !== hash) {
    throw new Error(`${filename}: SHA-256 mismatch. Expected ${hash}, got ${actualHash}. Refusing to ship a damaged image.`);
  }
  fs.writeFileSync(path.join(outputAssets, filename), data);
  console.log(`Built ${filename} (${data.length.toLocaleString()} bytes)`);
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(outputAssets, { recursive: true });
fs.copyFileSync(path.join(root, "index.html"), path.join(dist, "index.html"));

const thorn = fs.readFileSync(path.join(root, "assets", "aurae-thorn-shirt.webp"));
const thornHash = sha256(thorn);
if (thornHash !== "f5375b26658eae4e1f60cad5b127943cf8c95ed607aa58070f29d64aba56e0e9") {
  throw new Error("Thorn Shirt image checksum mismatch. Refusing to ship a damaged image.");
}
fs.copyFileSync(path.join(root, "assets", "aurae-thorn-shirt.webp"), path.join(outputAssets, "aurae-thorn-shirt.webp"));
console.log(`Built aurae-thorn-shirt.webp (${thorn.length.toLocaleString()} bytes)`);

writeImage({
  folder: "money-fixed",
  parts: 13,
  filename: "aurae-money-maker-tee.webp",
  bytes: 9644,
  hash: "76c3504db696b821f4ce7e9e4cfb49eebdc7c217a68726e56e185b457e58fbc5"
});
writeImage({
  folder: "spider-fixed",
  parts: 8,
  filename: "aurae-spider-shorts.webp",
  bytes: 5294,
  hash: "c913eb33a536ec1e059629cb0e080f8449758c40ae93ee3232d1638bedc10669"
});
console.log("AURAÈ storefront built successfully.");
