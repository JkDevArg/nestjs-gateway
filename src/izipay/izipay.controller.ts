import { Body, Controller, Post } from "@nestjs/common";
import { IzipayService } from "./izipay.service";
import { GenerateTokenIzipayApiDto } from "./dto/create-izipay.dto";
import { Auth } from "src/auth/decorators/auth.decorator";
import { Role } from "src/common/enums/rol.enum";

@Auth(Role.USER)
@Controller('ch1')
export class IzipayController {
    constructor(private readonly IzipayService: IzipayService) { }

    @Post('token')
    async token(@Body() GenerateTokenIzipayApiDto: GenerateTokenIzipayApiDto) {
        return this.IzipayService.tokenGenerate(GenerateTokenIzipayApiDto);
    }
}
