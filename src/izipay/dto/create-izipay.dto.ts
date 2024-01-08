import { Optional } from "@nestjs/common";
import { IsString, MaxLength, MinLength } from "class-validator";

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

export class SaveTokenWithuser {
    @IsString()
    @MinLength(1)
    transactionId: string;

    @IsString()
    @MinLength(1)
    merchantCode: string;

    @IsString()
    userEmail: string;

    @IsString()
    token: string;
}

export class ValidateAccount {
    @IsString()
    @MinLength(1)
    transactionId: string;

    @IsString()
    @MinLength(7)
    @MaxLength(15)
    merchantCode: string;

    @IsString()
    @MinLength(7)
    @MaxLength(15)
    facilitatorCode: string;

    /* order */
    @IsString()
    @MinLength(6)
    @MaxLength(15)
    orderNumber: string;

    @IsString()
    @MinLength(3)
    @MaxLength(3)
    currency: string;

    @IsString()
    amount: string;

    @IsString()
    @Optional()
    @MinLength(2)
    @MaxLength(2)
    installments: string;

    @IsString()
    @MaxLength(1)
    deferred: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    payMethod: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    channel: string;

    @IsString()
    @MinLength(2)
    @MaxLength(50)
    processType: string;

    @IsString()
    @MinLength(10)
    @MaxLength(40)
    datetimeTerminalTransaction: string;

    /* card */
    @IsString()
    @MinLength(2)
    @MaxLength(2)
    brand: string;

    @IsString()
    @MinLength(1)
    @MaxLength(400)
    pan: string;

    @IsString()
    expirationMonth: string;

    @IsString()
    expirationYear: string;

    @IsString()
    @MinLength(1)
    @MaxLength(400)
    cvc: string;

    @IsString()
    @MinLength(2)
    @MaxLength(2)
    cvcPresent: string;

    /* Cardholder */
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    firstname: string;

    @IsString()
    @MinLength(3)
    @MaxLength(50)
    lastname: string;

    @IsString()
    @MinLength(5)
    @MaxLength(50)
    email: string;

    @IsString()
    @MinLength(9)
    @MaxLength(11)
    phoneNumber: string;

    @IsString()
    @MinLength(2)
    @MaxLength(9)
    documentType: string;

    @IsString()
    @MinLength(8)
    @MaxLength(15)
    document: string;

    /* Is Last parameters out */
    @IsString()
    @MaxLength(3)
    language: string;
}