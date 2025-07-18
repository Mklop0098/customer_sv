import Logger from "@core/utils/logger"
import { Response } from "express"
import { IErrors } from "@core/interfaces"
import { ValidationError } from "class-validator"

export default function sendResponse<T>(res: Response, statusCode: number, message: string, data?: T, field?: string | ValidationError[], errors?: IErrors | null) {
    Logger.info(message)
    if ((statusCode == 404 || statusCode == 400 || statusCode == 403) && !field && !errors) {
        return res.status(200).json({
            statusCode,
            message,
            ...data
        })
    }
    if ((data || statusCode == 200 || 201) && !field && !errors) {
        return res.status(statusCode).json({
            statusCode,
            message,
            ...data,
        })
    }
    if (field && Array.isArray(field) && field.length > 0) {
        console.log("field", field)
        return res.status(200).json({
            statusCode,
            errors: field.map(item => ({
                field: item.property,
                message: item.constraints ? item.constraints[Object.keys(item.constraints)[0]] : 'invalid data'
            }))
        })
    }
    if (field) {
        return res.status(200).json({
            statusCode,
            errors: [{
                field,
                message
            }]
        })
    }
    if (errors) {
        return res.status(200).json({
            statusCode,
            errors
        })
    }
}