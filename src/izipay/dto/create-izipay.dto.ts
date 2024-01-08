import { IsString, MinLength } from "class-validator";

/* 
    Dto para crear el token consumiendo la api de IZIPAY
*/
export class GenerateTokenIzipayApiDto {
    @IsString()
    @MinLength(1)
    transactionId: string;

    @IsString()
    @MinLength(1)
    requestSource: string;

    @IsString()
    @MinLength(1)
    merchantCode: string;

    @IsString()
    @MinLength(1)
    orderNumber: string;

    @IsString()
    @MinLength(1)
    publicKey: string;

    @IsString()
    amount: string;
}