import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
  } from "typeorm";
  import { User } from "./User";
  import { ProjectAccess } from "./ProjectAccess";
  
  @Entity()
  export class Project {
    @PrimaryGeneratedColumn("uuid")
    id: string;
  
    @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
    owner: User;
  
    @Column()
    name: string;
  
    @Column("json", { nullable: true })
    metadata: any; // Additional project details, settings, etc.
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    // Relations
    @OneToMany(() => ProjectAccess, (access) => access.project)
    accessList: ProjectAccess[];
  }
  