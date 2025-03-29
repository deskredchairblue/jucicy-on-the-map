import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
  } from "typeorm";
  import { Session } from "./Session";
  import { Subscription } from "./Subscription";
  import { Project } from "./Project";
  import { Notification } from "./Notification";
  
  @Entity()
  export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;
  
    @Column({ unique: true })
    email: string;
  
    @Column({ nullable: true })
    phone?: string;
  
    @Column()
    password: string;
  
    @Column("simple-array")
    roles: string[];
  
    @Column({ default: true })
    isActive: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    // Relations
    @OneToMany(() => Session, (session) => session.user)
    sessions: Session[];
  
    @OneToMany(() => Subscription, (subscription) => subscription.user)
    subscriptions: Subscription[];
  
    // Add additional profile fields as necessary
  }
  