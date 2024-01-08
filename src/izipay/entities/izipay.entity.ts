import { User } from "src/users/entities/user.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne } from "typeorm";


@Entity()
export class Izipay {
    @Column({ primary: true, generated: true })
    id: number;

    @Column()
    transactionId: string;

    @Column()
    requestSource: string;

    @Column()
    merchantCode: string;

    @Column()
    orderNumber: string;

    @Column()
    amount: string;

    @DeleteDateColumn()
    deletedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userEmail', referencedColumnName: 'email',  })
    user: User;

    @Column()
    userEmail: string;
}