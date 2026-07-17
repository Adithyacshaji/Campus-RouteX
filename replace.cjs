const fs = require("fs");
const path = require("path");

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith(".js") || dirFile.endsWith(".jsx")) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync("src");

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  
  // Replace F1 and F2 keys, values, and node names
  let newContent = content
    .replace(/"F1"/g, "\"1\"")
    .replace(/"F2"/g, "\"2\"")
    .replace(/F1:/g, "1:")
    .replace(/F2:/g, "2:")
    .replace(/_F1/g, "_1")
    .replace(/_F2/g, "_2")
    .replace(/F1 /g, "1 ")
    .replace(/F2 /g, "2 ");
    
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, "utf8");
    console.log("Updated " + file);
  }
});

