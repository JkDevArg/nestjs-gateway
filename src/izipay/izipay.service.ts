import { Injectable, Request } from '@nestjs/common';
import { GenerateTokenIzipayApiDto, SaveTokenWithuser, ValidateAccount } from './dto/create-izipay.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { axiosErrorHandler } from 'src/common/utils/http-resp.utils';
import { LoginIzipay } from './entities/izipay.entity';

@Injectable()
export class IzipayService {
    private readonly baseUrl = process.env.IZI_URL_TEST;

    constructor(
        @InjectRepository(LoginIzipay)
        private readonly loginIzipayRepository: Repository<LoginIzipay>,
      ) {}

    async tokenGenerate(GenerateToken: GenerateTokenIzipayApiDto, { email }: { email: string }) {

        const headers = {
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
        const resp = await axiosErrorHandler(axiosPromise);

        /* Logica para guardar el token generado por IziPay para manterlo con el usuario */
        if (resp) {
            const SaveTokenWithuser = {
                transactionId: GenerateToken.transactionId,
                merchantCode: GenerateToken.merchantCode,
                userEmail: email,
                token: resp.response.token
            }
            await this.saveTokenWithUser(SaveTokenWithuser);
        }

        return resp;
    }

    async saveTokenWithUser(SaveTokenWithuser: SaveTokenWithuser) {
        const userEmail = SaveTokenWithuser.userEmail;
        const find = await this.loginIzipayRepository.findOneBy({ userEmail })
        console.log(find);

        if (!find)
            return this.loginIzipayRepository.save(SaveTokenWithuser);

        return true;
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