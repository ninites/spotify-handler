import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { UserInfos, UserRelease } from 'src/users/dto/create-user.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { updatableTemplatesPart } from './template-updatable-values/new-releases-up';

@Injectable()
export class MailService {
  constructor(private readonly httpService: HttpService) {}
  private readonly transporter = nodemailer.createTransport({
    host: 'in-v3.mailjet.com',
    include: 'spf.mailjet.com',
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: process.env.MAIL_LOG,
      pass: process.env.MAIL_PASS,
    },
  });

  private readonly templates = {
    newReleases: {
      path:
        process.env.HOST_URL + 'static/mail-templates/new-releases/index.html',
    },
  };

  async sendNewReleases(userInfos: UserInfos, releases: UserRelease[]) {
    const basicTemplate = await this.fetchMailTemplate(
      this.templates.newReleases.path,
    );

    const updatedTemplate = releases.map((release) => {
      const replacers = {
        // '{{ALBUM_COVER}}': release.images[0],
        '{{ALBUM_TITLE}}}': release.name,
        // '{{ALBUM_ARTIST}}': release.artists[0].name,
        '{{ALBUM_RELEASEDATE}}': release.release_date,
        '{{ADD_ALBUM_LINK}}': '',
      };

      return this.updateTemplate(updatableTemplatesPart.newRelease, replacers);
    });
    // console.log(updatedTemplate);

    const replacer = {
      '{{WRAPPER}}': updatedTemplate.join(''),
    };

    const mail = this.updateTemplate(basicTemplate, replacer);

    const config = {
      from: `Album out <${process.env.TRANS_MAIL}>`,
      to: userInfos.email,
      subject: 'Les dernieres sorties des artistes que vous suivez',
      html: mail,
    };

    try {
      await this.transporter.sendMail(config);
      return true;
    } catch (err) {
      throw new HttpException(
        '[NEWRELEASES/MAIL] mail send fail',
        HttpStatus.CONFLICT,
      );
    }
  }

  private async fetchMailTemplate(templatePath): Promise<string> {
    const mailObs$ = this.httpService.get(templatePath);
    const objectMail = await firstValueFrom(mailObs$);
    return objectMail.data;
  }

  private updateTemplate(updateParts, replacers): string {
    const regEx = new RegExp(Object.keys(replacers).join('|'), 'gi');
    const updatedMailParts = updateParts.replace(
      regEx,
      (matched) => replacers[matched],
    );
    return updatedMailParts;
  }
}
