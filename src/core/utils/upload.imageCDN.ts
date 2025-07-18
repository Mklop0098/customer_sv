import errorMessages from "@core/config/constants";
import { HttpException } from "@core/exceptions";
import path from 'path';
import fs from 'fs';
import axios from "axios";

// export const createFolder = (
//     folder_name: string,
//     file_name: string,
//     source: string,
//     file: Express.Multer.File,
//     type: string,
//     parent_id?: string
// ) => {
//     try {
//         const basePath = path.resolve(__dirname, '../../../uploads');
//         const sourcePath = path.join(basePath, source, type); // uploads/mid/product
//         const targetPath = path.join(sourcePath, folder_name); // uploads/mid/product/folder_name
//         const targetThumbnailPath = path.join(sourcePath, folder_name, 'thumbnails'); // uploads/mid/product/folder_name/thumbnail

//         // Tạo thư mục nếu chưa có
//         if (!fs.existsSync(targetPath)) {
//             fs.mkdirSync(targetPath, { recursive: true });
//         }
//         if (!fs.existsSync(targetThumbnailPath)) {
//             fs.mkdirSync(targetThumbnailPath, { recursive: true });
//         }
//         // Lấy đuôi file từ mimetype hoặc tên file gốc
//         const ext = path.extname(file.originalname) || `.${file.mimetype.split('/')[1]}`;
//         let baseName = file_name;
//         let finalFileName = `${baseName}${ext}`;
//         let counter = 1;

//         // Kiểm tra và tăng số thứ tự nếu file đã tồn tại
//         while (fs.existsSync(path.join(targetPath, finalFileName))) {
//             finalFileName = `${baseName}_${counter}${ext}`;
//             counter++;
//         }

//         const uploadPath = path.join(targetPath, finalFileName);
//         const uploadThumbnailPath = path.join(targetThumbnailPath, finalFileName);

//         // Ghi file
//         fs.writeFileSync(uploadPath, file.buffer);
//         fs.writeFileSync(uploadThumbnailPath, file.buffer);
//         // Trả về đường dẫn tương đối nếu cần
//         return path.relative(basePath, uploadPath);
//     } catch (error) {
//         console.error('Create folder error:', error);
//         return new HttpException(400, errorMessages.UPLOAD_FAILED);
//     }
// };
export const createFolder = async (
    folder_name: string,
    file_name: string,
    source: string,
    file: Express.Multer.File,
    type: string,
    parent_id?: string
) => {
    try {
        const basePath = path.resolve(__dirname, '../../../uploads');
        const sourcePath = path.join(basePath, source, type);
        const targetPath = path.join(sourcePath, folder_name);

        // Tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(targetPath)) fs.mkdirSync(targetPath, { recursive: true });

        const ext = path.extname(file.originalname) || `.${file.mimetype.split('/')[1]}`;
        let baseName = file_name;
        let finalFileName = `${baseName}${ext}`;
        let counter = 1;

        // Nếu file tồn tại, tăng số thứ tự
        while (fs.existsSync(path.join(targetPath, finalFileName))) {
            finalFileName = `${baseName}_${counter}${ext}`;
            counter++;
        }

        const uploadPath = path.join(targetPath, finalFileName);

        // Ghi file & thumbnail
        fs.writeFileSync(uploadPath, file.buffer);

        // Gọi upload
        const fileBuffer = fs.readFileSync(uploadPath);
        const blob = new Blob([fileBuffer], { type: file.mimetype });
        const uploadResult = await upload(
            [blob],         // gửi 1 file
            type,
            folder_name,
            path.parse(finalFileName).name,  // không có đuôi
            source,
            '0', // width
            '0', // height
            parent_id
        );

        // Xoá file sau khi upload thành công
        fs.unlinkSync(uploadPath);

        // Xoá toàn bộ folder gốc (bao gồm thumbnails)
        fs.rmSync(targetPath, { recursive: true, force: true });

        return uploadResult;

    } catch (error) {
        console.error('Create folder error:', error);
        return new HttpException(400, errorMessages.UPLOAD_FAILED);
    }
};

export const upload = async (files: Blob[], type: string, folder_name: string, file_name: string, source: string, width: string, height: string, parent_id?: string) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    })
    formData.append('type', type);
    formData.append('folder_name', folder_name);
    formData.append('file_name', file_name);
    formData.append('source', source);
    formData.append('width', width);
    formData.append('height', height);
    if (parent_id) {
        formData.append('parent_id', parent_id);
    }
    const response = await axios.post(process.env.UPLOAD_SERVICE_URL as string, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data
}

export const getImage = async (id: string, source: string, type: string) => {
    if (!id || !source || !type) return []
    try {
        const response = await axios.get(`${process.env.UPLOAD_SERVICE_URL}?folder=${id}&type=${type}&source=${source}`);
        if (response.data.statusCode === 200) {
            return response.data.data
        }
        return []
    } catch (error) {
        return []
    }
}

export const deleteOneImage = async (id: string, source: string, type: string) => {
    if (!id) return []
    try {
        const response = await axios.delete(`${process.env.UPLOAD_SERVICE_URL}/delete/${id}`);
        return response.data
    } catch (error) {
        return new HttpException(400, errorMessages.DELETE_FAILED)
    }
}

export const deleteAllImage = async (id: string, source: string, type: string) => {
    if (!id) return []
    try {
        const response = await axios.delete(`${process.env.UPLOAD_SERVICE_URL}/delete-all/${id}?source=${source}&type=${type}`);
        if (response.data.statusCode === 200) {
            return response.data.data
        }
        return []
    } catch (error) {
        return new HttpException(400, errorMessages.DELETE_FAILED)
    }
}

export const updateImageSubProduct = async (
    folder_name: string,
    file_name: string,
    source: string,
    type: string,
    id: string,
    parent_id?: string) => {
    console.log(folder_name, file_name, source, type, id, parent_id)
    try {
        const response = await axios.put(`${process.env.UPLOAD_SERVICE_URL}/update-sub-product/${id}`, {
            folder_name,
            file_name,
            source,
            type,
            parent_id
        });
        return response.data
    } catch (error) {
        return new HttpException(400, errorMessages.UPDATE_FAILED)
    }
}   