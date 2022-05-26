import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('User')
export class UserEntity {
  @PrimaryGeneratedColumn()
  user_number: number;

  @Column()
  user_id: string;

  @Column()
  user_nickname: string;
}
