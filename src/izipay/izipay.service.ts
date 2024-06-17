import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { axiosErrorHandler } from 'src/common/utils/http-resp.utils';
import { AnnulmentDto, CardTokenCreationDto, GenerateTokenIzipayApiDto, GetCuotesDto, GetOrderDto, GetTokenInfoDto, RefundDto, ValidateAccountDto } from './dto/create-izipay.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginIzipay } from './entities/izipay.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { generateOrder } from 'src/common/utils/generate-order';

@Injectable()
export class IzipayService {
    private readonly URL = process.env.MODE === 'TEST' ? process.env.IZI_URL_TEST : process.env.IZI_URL_PROD;
    private readonly baseUrl = URL;

    constructor(
        @InjectRepository(LoginIzipay)
        private readonly loginIzipayRepository: Repository<LoginIzipay>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) { }

    async tokenGenerate(GenerateToken: GenerateTokenIzipayApiDto, { email }: { email: string }) {
        const headers = {
            'Content-type': 'application/json',
            'transactionId': GenerateToken.transactionId,
        };

        const data = {
            requestSource: GenerateToken.requestSource,
            merchantCode: GenerateToken.merchantCode,
            orderNumber: GenerateToken.orderNumber ?? generateOrder.generateOrderNumber(),
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
                token: resp.response.token,
                publicKey: GenerateToken.publicKey
            }

            const saveData = this.loginIzipayRepository.save(SaveTokenWithuser);
            await this.cacheManager.set('user_data', SaveTokenWithuser);
        }

        return resp;
    }

    async validateAccount(ValidateAccount: ValidateAccountDto) {

        const existsCache = await this.cacheManager.get('user_data');
        console.log(existsCache);

        const headers = {
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

        return data;
    }

    async getCuotes(GetCoutes: GetCuotesDto) {

        const existsCache = await this.cacheManager.get('user_data');

        const headers = {
            'Content-type': 'application/json',
            'transactionId': GetCoutes.transactionId ? GetCoutes.transactionId : existsCache['transactionId'],
            'Authorization': `Bearer ${existsCache['token']}`,
        };

        const data = {
            "bin": GetCoutes.bin,
            "merchantCode": GetCoutes.merchantCode ? GetCoutes.merchantCode : existsCache['merchantCode'],
            "language": GetCoutes.language
        }

        const axiosPromise = axios.post(`${this.baseUrl}/Installments/v1/Installments/Search`, data, { headers });
        const resp = await axiosErrorHandler(axiosPromise);

        return resp;
    }

    async getOrder(GetOrder: GetOrderDto) {
        const existsCache = await this.cacheManager.get('user_data');

        const headers = {
            'Content-type': 'application/json',
            'transactionId': GetOrder.transactionId ? GetOrder.transactionId : existsCache['transactionId'],
            'Authorization': `Bearer ${existsCache['token']}`,
        };

        const data = {
            "merchantCode": GetOrder.merchantCode ? GetOrder.merchantCode : existsCache['merchantCode'],
            "numberOden": GetOrder.numberOrden,
            "language": GetOrder.language,
            "isInternal": GetOrder.isInternal
        }

        const axiosPromise = axios.post(`${this.baseUrl}/orderinfo/v1/Transaction/Search`, data, { headers });
        const resp = await axiosErrorHandler(axiosPromise);

        return resp;
    }

    async annulment(Annulment: AnnulmentDto) {
        const existsCache = await this.cacheManager.get('user_data');

        const headers = {
            'Content-type': 'application/json',
            'transactionId': Annulment.transactionId ? Annulment.transactionId : existsCache['transactionId'],
            'Authorization': `Bearer ${existsCache['token']}`,
        };

        const data = {
            "merchantCode": Annulment.merchantCode ? Annulment.merchantCode : existsCache['merchantCode'],
            "order": {
                "numberOden": Annulment.orderNumber,
                "currency": Annulment.currency,
                "amount": Annulment.amount,
                "payMethod": Annulment.payMethod,
                "channel": Annulment.channel,
                "uniqueId": Annulment.uniqueId,
                "authorizationCode": Annulment.authorizationCode,
                "transactionDatetime": Annulment.transactionDatetime,
            },
            "language": Annulment.language,
        }

        const axiosPromise = axios.post(`${this.baseUrl}/cancel/api/Transaction/Cancel`, data, { headers });
        const resp = await axiosErrorHandler(axiosPromise);

        return resp;
    }

    async refund(Refund: RefundDto) {
        const existsCache = await this.cacheManager.get('user_data');

        const headers = {
            'Content-type': 'application/json',
            'transactionId': Refund.transactionId ? Refund.transactionId : existsCache['transactionId'],
            'Authorization': `Bearer ${existsCache['token']}`,
        };

        const data = {
            "merchantCode": Refund.merchantCode ? Refund.merchantCode : existsCache['merchantCode'],
            "ruc": Refund.ruc,
            "idUnique": Refund.idUnique,
            "order": {
                "orderNumber": Refund.orderNumber,
                "amount": Refund.amount,
                "installments": Refund.installments,
                "deferred": Refund.deferred,
                "payMethod": Refund.payMethod,
                "channel": Refund.channel,
                "processType": Refund.processType,
                "datetimeTerminalTransaction": Refund.datetimeTerminalTransaction,
            },
            "card": {
                "brand": Refund.brand,
                "pan": Refund.pan,
                "expirationMonth": Refund.expirationMonth,
                "expirationYear": Refund.expirationYear,
                "cvc": Refund.cvc,
                "cvcPresent": Refund.cvcPresent,
            },
            "language": Refund.language,
        }

        const axiosPromise = axios.post(`${this.baseUrl}/refund/v1/Transaction/Refund`, data, { headers });
        const resp = await axiosErrorHandler(axiosPromise);

        return resp;
    }

    async cardTokenCreation(CardTokenCreation: CardTokenCreationDto) {
        const existsCache = await this.cacheManager.get('user_data');

        const headers = {
            'Content-type': 'application/json',
            'transactionId': CardTokenCreation.transactionId ? CardTokenCreation.transactionId : existsCache['transactionId'],
            'Authorization': `Bearer ${CardTokenCreation['token']}`,
        };

        const data = {
            "merchantCode": CardTokenCreation.merchantCode,
            "facilitatorCode": CardTokenCreation.facilitatorCode,
            "card": {
                "orderNumber": CardTokenCreation.orderNumber,
                "datetimeTerminalTransaction": CardTokenCreation.datetimeTerminalTransaction,
                "pan": CardTokenCreation.pan,
                "expirationMonth": CardTokenCreation.expirationMonth,
                "expirationYear": CardTokenCreation.expirationYear,
                "cvc": CardTokenCreation.cvc,
                "brand": CardTokenCreation.brand,
                "alias": CardTokenCreation.alias,
            },
            "cardHolder": {
                "merchantBuyerId": CardTokenCreation.merchantBuyerId,
                "firstname": CardTokenCreation.firstname,
                "lastname": CardTokenCreation.lastname,
                "email": CardTokenCreation.email,
                "phoneNumber": CardTokenCreation.phoneNumber,
                "documentType": CardTokenCreation.documentType,
                "document": CardTokenCreation.document,
            },
            "buyer": {
                "merchantBuyerId": CardTokenCreation.merchantBuyerId,
                "firstName": CardTokenCreation.firstname,
                "lastName": CardTokenCreation.lastname,
                "email": CardTokenCreation.email,
                "phoneNumber": CardTokenCreation.phoneNumber,
                "documentType": CardTokenCreation.documentType,
                "document": CardTokenCreation.document
            },
            "billingAddress": {
                "street": CardTokenCreation.street,
                "city": CardTokenCreation.city,
                "state": CardTokenCreation.state,
                "country": CardTokenCreation.country,
                "postalCode": CardTokenCreation.postalCode
            },
            "language": CardTokenCreation.language,
            "clinetIp": CardTokenCreation.clientIp
        }

        const axiosPromise = axios.post(`${this.baseUrl}/tokenization/external/api/v1/tokens`, data, { headers });
        const resp = await axiosErrorHandler(axiosPromise);

        return resp;
    }

    async tokenGetInfo(GetTokenInfo: GetTokenInfoDto) {
        const existsCache = await this.cacheManager.get('user_data');

        const headers = {
            'Content-type': 'application/json',
            'transactionId': GetTokenInfo.transactionId ? GetTokenInfo.transactionId : existsCache['transactionId'],
            'Authorization': `Bearer ${existsCache['token']}`,
        };

        const data = {
            "merchantCode": GetTokenInfo.merchantCode,
            "facilitatorCode": GetTokenInfo.facilitatorCode,
            "datetimeTerminalTransaction": GetTokenInfo.datetimeTerminalTransiction,
            "language": GetTokenInfo.language,
            "isInternal": GetTokenInfo.isInternal,
            "buyer": {
                "merchantBuyerId": GetTokenInfo.merchantBuyerId,
                "buyerToken": GetTokenInfo.buyerToken
            }
        }

        const axiosPromise = axios.post(`${this.baseUrl}/tokenization/external/api/v1/tokens/token`, data, { headers });
        const resp = await axiosErrorHandler(axiosPromise);

        return resp;
    }

    async generateLinkPayment(){
        
    }
}