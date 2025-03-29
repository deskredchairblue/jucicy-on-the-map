import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";
  import { User } from "./User";
  
  @Entity()
  export class Subscription {
    @PrimaryGeneratedColumn("uuid")
    id: string;
  
    @ManyToOne(() => User, (user) => user.subscriptions, { onDelete: "CASCADE" })
    user: User;
  
    @Column()
    plan: string; // e.g., Creator, Pro, Studio+
  
    @Column({ type: "timestamp" })
    startDate: Date;
  
    @Column({ type: "timestamp", nullable: true })
    endDate: Date;
  
    @Column({ default: "active" })
    status: string; // active, canceled, past_due, etc.
  
    @Column({ nullable: true })
    stripeSubscriptionId: string;
  
    @Column({ nullable: true })
    paypalSubscriptionId: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  