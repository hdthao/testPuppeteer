// module fs cho phép làm việc với cái file trên hệ thống
const fs = require('fs');
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ 
    // để trang web có thể hiển thị
    headless: false,
    //  để trang web có thể hiển thị full width, height
    defaultViewport : false 
  });
  const page = await browser.newPage();
  await page.goto('https://google.com');
  // nhập dữ liệu vào thanh search (.glFyF  là selector HTML)
  await page.type('.gLFyf',' angular');
  // click vào nút tìm kiếm 
  await page.click('div.A8SBwf > div.FPdoLc.lJ9FBc > center > input.gNO89b');
  // selector HTML, ở trong trường hợp này là kết quả đầu tiên với từ khóa tìm kiếm là 'angular'
  const item = 'div > div > div > div > div > div > div.yuRUbf > a > h3';
  // đợi element chỉ định xuất hiện, nếu không sẽ báo lỗi
  await page.waitForSelector(item);
  // click vào element
  await page.click(item);
  // đợi element chỉ định xuất hiện, nếu không sẽ không có data
  await page.waitForSelector('div > div > article > div > div:nth-child(3)');
  let dataCSV = [];
  // page.evaluate() cho phép ta chạy script trong browser và lấy kết quả trả về
  const crawlData = await page.evaluate(() => {
    const dataArr = [];
    // lấy tất cả những element có selector như bên dưới
    // trong trường hợp này là các content có selector như bên dưới của trang 'https://angular.io/'
    const listData = document.querySelectorAll('div > div > article > div > div:nth-child(3) > .text-container');
    listData.forEach((elm) => {
      const data = {};
      try {
        data.title = elm.querySelector('section > h2.text-headline').innerText;
        data.desc = elm.querySelector('section > p:nth-child(3)').innerText;
        data.url = elm.querySelector('section > p:nth-child(4) > a').getAttribute('href');
        data.imgUrl = elm.querySelector('section > p:nth-child(2) > img').getAttribute('src');
      } catch (error) {}
      dataArr.push(data);
    });
    return dataArr;
  });

  dataCSV = crawlData;

  function writeToCSVFile(data) {
    const filename = 'outputss.csv';
    fs.writeFile(filename, extractAsCSV(data), err => {
      if (err) {
        console.log('Error writing to csv file', err);
      } else {
        console.log(`saved as ${filename}`);
      }
    });
  }

  function extractAsCSV(data) {
    const header = ["Title, Desc, Url, imgUrl"];
    const rows = data.map(e =>
       `${e.title}, ${e.desc.replace(/,/g, ".")}, ${e.url}, ${e.imgUrl}`
    );
    return header.concat(rows).join("\n");
  }
  
  // đóng trình duyệt khi thực hiện xong
  await browser.close();
  writeToCSVFile(dataCSV);
})();
