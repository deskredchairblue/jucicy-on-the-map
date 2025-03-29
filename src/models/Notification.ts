import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from "typeorm";
  import { User } from "./User";
  
  @Entity()
  export class Notification {
    @PrimaryGeneratedColumn("uuid")
    id: string;
  
    @ManyToOne(() => User, { onDelete: "CASCADE" })
    user: User;
  
    @Column()
    message: string;
  
    @Column({ default: false })
    read: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  }
  