import { AppPage } from './app.po';
import { browser, element, by } from 'protractor';

describe('workspace-project App', () => {
  browser.waitForAngularEnabled(false);
  browser.waitForAngular();

  beforeEach(() => {
    browser.get('/'); // 浏览器导航到该地址
  });

  it('should display welcome message', async () => {
    const inputs = element.all(by.css('input'));
    inputs.get(0).sendKeys('admin@bili.cn');
    inputs.get(1).sendKeys('Chen@1102');
    browser.sleep(2000);
    const btn = element(by.buttonText('登录'));
    btn.click();
    browser.sleep(2000);

    browser.get('/datastores/5f39e81cf00a1b2d7c4682f7/list'); // 浏览器导航到该地址
    browser.sleep(1000);
    element(by.css('_ngcontent-yws-c363')).click();
    browser.sleep(1000);
    element(by.buttonText('选择文件')).click();
    // expect(page.getTitleText()).toEqual('Welcome to web-ui!');
  });
});
