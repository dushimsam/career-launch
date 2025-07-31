import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { NotificationType } from '../common/enums/user-status.enum';

@Entity('notifications')
export class Notification {
  @ApiProperty({ description: 'Unique identifier for the notification' })
  @PrimaryGeneratedColumn('uuid')
  notificationID: string;

  @ApiProperty({ 
    description: 'Type of notification',
    enum: NotificationType 
  })
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @ApiProperty({ description: 'Notification title' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Notification message' })
  @Column('text')
  message: string;

  @ApiProperty({ description: 'Whether the notification has been read' })
  @Column({ default: false })
  isRead: boolean;

  @ApiProperty({ description: 'Additional data related to the notification' })
  @Column('json', { nullable: true })
  data?: Record<string, any>;

  @ApiProperty({ description: 'URL to navigate to when notification is clicked' })
  @Column({ nullable: true })
  actionURL?: string;

  @ApiProperty({ description: 'When the notification was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When the notification was read' })
  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @ApiProperty({ description: 'Priority level of the notification' })
  @Column({ default: 0 })
  priority: number;

  @ApiProperty({ description: 'Whether the notification expires' })
  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  // Relations
  @ApiProperty({ description: 'User who should receive this notification' })
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userID' })
  user: User;

  @Column()
  userID: string;
}
