import { Body, Controller, Post, Request } from "@nestjs/common";
import { IzipayService } from "./izipay.service";
import { GenerateTokenIzipayApiDto, ValidateAccount } from "./dto/create-izipay.dto";
import { Auth } from "src/auth/decorators/auth.decorator";
import { Role } from "src/common/enums/rol.enum";
import { RequestWithUser } from "src/auth/interface/req.interface";

@Auth(Role.USER)
@Controller('ch1')
export class IzipayController {
    constructor(private readonly IzipayService: IzipayService) { }

    @Post('token')
    async token(@Body() GenerateTokenIzipayApiDto: GenerateTokenIzipayApiDto, @Request() req: RequestWithUser) {
        const email = req.user.email;
        return this.IzipayService.tokenGenerate(GenerateTokenIzipayApiDto, { email });
    }

    @Post('validate')
    async autorization(@Body() ValidateAccount: ValidateAccount) {
        return true;
    }
}
