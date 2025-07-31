import { BaseEntity } from 'src/db/base-entity';
import { Column, Entity, Index } from 'typeorm';
import { FounderDTO } from '../dto/founder.dto';

@Entity()
export class Founder extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  @Index({ unique: true })
  email: string;

  fromDTO(founderDto: FounderDTO) {
    this.name = founderDto.name;
    this.email = founderDto.email;
  }
}
