const fs = require('fs');
const path = require('path');
function removeCommentsAndTrimHTML(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file ${filePath}:`, err);
            return;
        }
        // HTML yorumlarını (<!-- ... -->) kaldırma
        let result = data.replace(/<!--[\s\S]*?-->/g, '');
        // Satır başındaki ve sonundaki boşlukları kaldırma, birden fazla boşluğu tek bir boşluk yapma
        result = result.replace(/\s+/g, ' ').trim();
        fs.writeFile(filePath, result, 'utf8', (err) => {
            if (err) {
                console.error(`Error writing file ${filePath}:`, err);
                return;
            }
            console.log(`Comments and unnecessary spaces removed from ${filePath}`);
        });
    });
}
function processMainDirectory() {
    const dirPath = path.join(__dirname, '');
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            console.error(`Error reading directory ${dirPath}:`, err);
            return;
        }
        files.forEach((file) => {
            const fullPath = path.join(dirPath, file);
            // Yalnızca ana klasördeki .html dosyalarını işleme
            if (fs.statSync(fullPath).isFile() && path.extname(fullPath) === '.html') {
                removeCommentsAndTrimHTML(fullPath);
            }
        });
    });
}
processMainDirectory();
