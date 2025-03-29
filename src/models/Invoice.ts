import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from "typeorm";
  import { User } from "./User";
  import { Subscription } from "./Subscription";
  
  @Entity()
  export class Invoice {
    @PrimaryGeneratedColumn("uuid")
    id: string;
  
    @ManyToOne(() => User, { onDelete: "CASCADE" })
    user: User;
  
    @ManyToOne(() => Subscription, { onDelete: "CASCADE" })
    subscription: Subscription;
  
    @Column("decimal", { precision: 10, scale: 2 })
    amount: number;
  
    @Column()
    currency: string;
  
    @Column()
    status: string; // paid, pending, failed, etc.
  
    @Column({ nullable: true })
    pdfUrl: string; // Link to downloadable PDF invoice
  
    @CreateDateColumn()
    createdAt: Date;
  }
  