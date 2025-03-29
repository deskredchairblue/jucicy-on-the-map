import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from "typeorm";
  import { User } from "./User";
  
  @Entity()
  export class FeatureUsage {
    @PrimaryGeneratedColumn("uuid")
    id: string;
  
    @ManyToOne(() => User, { onDelete: "CASCADE" })
    user: User;
  
    @Column()
    featureName: string;
  
    @Column("int", { default: 0 })
    usageCount: number;
  
    @Column({ nullable: true })
    period: string; // e.g., "monthly", "daily"
  
    @CreateDateColumn()
    createdAt: Date;
  }
  