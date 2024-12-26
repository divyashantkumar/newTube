import fs from 'fs';

export async function deleteFiles() {
    const folderPath = path.join(process.cwd(), 'public', 'uploads');

    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach((file, index) => {
            const curPath = path.join(folderPath, file);
            fs.unlink(curPath, error => {
                if (error) {
                    throw error
                }
                console.log(`${file} is deleted`);
            });
        });
        console.log(`All files in ${folderPath} deleted successfully!`);
        return;
    } else {
        console.log(`Folder ${folderPath} does not exist!`);
    }
}

export { deleteFiles }