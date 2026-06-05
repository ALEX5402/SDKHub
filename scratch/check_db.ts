import { XMLParser } from "fast-xml-parser";

function ensureArray(val: any): any[] {
  if (val === undefined || val === null) return [];
  return Array.isArray(val) ? val : [val];
}

const sources = [
  { url: "https://dl.google.com/android/repository/repository2-1.xml", type: "sdk/ndk (v1)" },
  { url: "https://dl.google.com/android/repository/repository2-3.xml", type: "sdk/ndk (v3)" },
  { url: "https://dl.google.com/android/repository/repository2-4.xml", type: "sdk/ndk (v4)" },
  { url: "https://dl.google.com/android/repository/cmake-releases.xml", type: "cmake" },
];

async function check() {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseAttributeValue: true,
  });

  console.log("Checking all upstream repository sources simultaneously...");

  await Promise.all(
    sources.map(async (source) => {
      try {
        console.log(`[${source.type}] Fetching from ${source.url}...`);
        const res = await fetch(source.url);
        if (!res.ok) {
          throw new Error(`HTTP status ${res.status}`);
        }
        const text = await res.text();
        const jsonObj = parser.parse(text);

        const rootKey = Object.keys(jsonObj).find(k => k.endsWith("repository") || k.endsWith("sdk-repository")) || "repository";
        const root = jsonObj[rootKey];
        if (!root) {
          console.warn(`[${source.type}] Could not find root repository key in XML payload.`);
          return;
        }

        const remotePackages = ensureArray(root.remotePackage);
        console.log(`[${source.type}] Successfully parsed ${remotePackages.length} packages.`);

        let macCount = 0;
        for (const pkg of remotePackages) {
          if (!pkg.archives || !pkg.archives.archive) continue;
          const archives = ensureArray(pkg.archives.archive);
          for (const archive of archives) {
            const os = archive["host-os"] || archive["@_host-os"] || "";
            if (os.toLowerCase().includes("mac")) {
              macCount++;
              const arch = archive["host-arch"] || archive["@_host-arch"] || "universal";
              if (macCount <= 3) {
                console.log(`  - [Sample macOS Pkg] ${pkg["@_path"]} -> OS: ${os}, Arch: ${JSON.stringify(arch)}`);
              }
            }
          }
        }
        console.log(`[${source.type}] Found total of ${macCount} macOS archive configurations.`);
      } catch (err: any) {
        console.error(`[${source.type}] Failed to sync from ${source.url}: ${err.message || err}`);
      }
    })
  );
}

check().catch(console.error);
