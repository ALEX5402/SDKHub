async function main() {
  const url = "http://localhost:3000/api/tools?name=system-images";
  console.log(`Fetching ${url}...`);
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Response Status:", res.status);
    console.log("Response Success:", data.success);
    console.log("Total items returned in data:", data.data?.length);
    if (data.data && data.data.length > 0) {
      console.log("Sample item from data:", data.data[0]);
    }
  } catch (e) {
    console.error("HTTP request failed:", e);
  }
}

main().catch(console.error);
