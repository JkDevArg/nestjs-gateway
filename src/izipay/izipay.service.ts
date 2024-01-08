import { Injectable, Request } from '@nestjs/common';
import { GenerateTokenIzipayApiDto, ValidateAccount } from './dto/create-izipay.dto';
import axios from 'axios';
import { axiosErrorHandler } from 'src/common/utils/http-resp.utils';

@Injectable()
export class IzipayService {
    private readonly baseUrl = process.env.IZI_URL_TEST;

    async tokenGenerate(GenerateToken: GenerateTokenIzipayApiDto, { email }: { email: string }) {

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

    async validateAccount(ValidateAccount: ValidateAccount) {
        const headers  = {
            'Content-type': 'application/json',
            'transactionId': ValidateAccount.transactionId,
        };

        const data = {
            "merchantCode": ValidateAccount.merchantCode,
            "facilitatorCode": ValidateAccount.facilitatorCode,
            "order": {
              "orderNumber": ValidateAccount.orderNumber,
              "currency": ValidateAccount.currency,
              "amount": ValidateAccount.amount,
              "installments": ValidateAccount?.installments,
              "deferred": ValidateAccount.deferred,
              "payMethod": ValidateAccount.payMethod,
              "channel": ValidateAccount.channel,
              "processType": ValidateAccount.processType,
              "datetimeTerminalTransaction": ValidateAccount.datetimeTerminalTransaction
            },
            "card": {
              "brand": ValidateAccount.brand,
              "pan": ValidateAccount.pan,
              "expirationMonth": ValidateAccount.expirationMonth,
              "expirationYear": ValidateAccount.expirationYear,
              "cvc": ValidateAccount.cvc,
              "cvcPresent": ValidateAccount.cvcPresent
            },
            "cardHolder": {
              "firstName": ValidateAccount.firstname,
              "lastName": ValidateAccount.lastname,
              "email": ValidateAccount.email,
              "phoneNumber": ValidateAccount.phoneNumber,
              "documentType": ValidateAccount.documentType,
              "document": ValidateAccount.document
            },
            "language": ValidateAccount.language
          }
    }

}