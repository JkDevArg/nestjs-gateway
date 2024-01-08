import { Injectable } from '@nestjs/common';
import { GenerateTokenIzipayApiDto } from './dto/create-izipay.dto';
import axios from 'axios';
import { axiosErrorHandler } from 'src/common/utils/http-resp.utils';

@Injectable()
export class IzipayService {
    private readonly baseUrl = process.env.IZI_URL_TEST;

    async tokenGenerate(GenerateToken: GenerateTokenIzipayApiDto) {

        const headers  = {
            'Content-type': 'application/json',
            'transactionId': GenerateToken.transactionId,
        };

        const data = {
            requestSource: GenerateToken.requestSource,
            merchantCode: GenerateToken.merchantCode,
            orderNumber: GenerateToken.orderNumber,
            publicKey: GenerateToken.publicKey,
            amount: GenerateToken.amount
        }

        const axiosPromise = axios.post(`${this.baseUrl}/security/v1/Token/Generate`, data, { headers });



        return await axiosErrorHandler(axiosPromise);
    }

}