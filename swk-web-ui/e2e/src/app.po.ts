import { browser, by, element } from 'protractor';

export class AppPage {

  login() {
    browser.waitForAngularEnabled();
    browser.get('/login');
    const username = element(by.css('input[formcontrolname="email"]'));
    const password = element(by.css('input[formcontrolname="password"]'));

    username.sendKeys('admin@bili.cn');
    console.log(username);
    password.sendKeys('Chen@1102');
    console.log(password);

    element(by.css('button')).click();
  }

  navigateTo() {
    return browser.get('/datastores/5f39e81cf00a1b2d7c4682f7/list');
  }

  upload() {
    element(by.buttonText('CSV')).click();
    element(by.buttonText('选择文件')).click();
  }
}
