import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from "typeorm";
  import { User } from "./User";
  
  @Entity()
  export class Session {
    @PrimaryGeneratedColumn("uuid")
    id: string;
  
    @ManyToOne(() => User, (user) => user.sessions, { onDelete: "CASCADE" })
    user: User;
  
    @Column()
    token: string;
  
    @Column({ nullable: true })
    deviceInfo: string;
  
    @Column({ type: "timestamp" })
    expiresAt: Date;
  
    @CreateDateColumn()
    createdAt: Date;
  }
  