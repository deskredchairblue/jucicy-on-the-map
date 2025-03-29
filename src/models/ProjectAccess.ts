import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from "typeorm";
  import { Project } from "./Project";
  import { User } from "./User";
  
  @Entity()
  export class ProjectAccess {
    @PrimaryGeneratedColumn("uuid")
    id: string;
  
    @ManyToOne(() => Project, (project) => project.accessList, { onDelete: "CASCADE" })
    project: Project;
  
    @ManyToOne(() => User, { onDelete: "CASCADE" })
    user: User;
  
    @Column()
    role: string; // e.g., admin, editor, viewer
  
    @Column("simple-array", { nullable: true })
    permissions: string[]; // e.g., ["read", "write"]
  
    @CreateDateColumn()
    createdAt: Date;
  }
  