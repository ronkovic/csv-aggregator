function processCSV() {
  const fileInput = document.getElementById('csvFile');
  const file = fileInput.files[0];

  const dateColumn = document.getElementById('dateColumn').value;
  const peopleColumn = document.getElementById('peopleColumn').value;
  const amountColumn = document.getElementById('amountColumn').value;
  const taxColumn = document.getElementById('taxColumn').value;

  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;

  if (!file) {
    alert("ファイルを選択してください");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (event) {
    const text = event.target.result;
    const decoder = new TextDecoder('shift-jis');
    const csvData = decoder.decode(new Uint8Array(event.target.result));

    const lines = csvData.split('\n');
    const headers = lines[0].split(',');

    // 各列のインデックスを取得
    const dateIndex = headers.findIndex(header => header.includes(dateColumn));
    const peopleIndex = headers.findIndex(header => header.includes(peopleColumn));
    const amountIndex = headers.findIndex(header => header.includes(amountColumn));
    const taxIndex = headers.findIndex(header => header.includes(taxColumn));

    if (dateIndex === -1 || peopleIndex === -1 || amountIndex === -1 || taxIndex === -1) {
      alert("指定された列名が見つかりません。");
      return;
    }

    let dailyResults = {
      allTime: {},
      rangeTime: {},
    };
    let weeklyResults = {
      allTime: {},
      rangeTime: {},
    };

    // 日付範囲を取得
    let firstDate = null;
    let lastDate = null;

    // 曜日を取得するための配列
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(',');
      if (cells == "") {
        break;
      }

      const dateTime = new Date(cells[dateIndex].replace(/"/g, ''));
      const date = dateTime.toISOString().split('T')[0];
      const time = dateTime.toTimeString().split(' ')[0];
      const weekday = weekdays[dateTime.getDay()]; // 曜日を取得

      // 最初の日付と最後の日付を設定
      if (!firstDate || dateTime < new Date(firstDate)) {
        firstDate = date;
      }
      if (!lastDate || dateTime > new Date(lastDate)) {
        lastDate = date;
      }

      // 日別集計
      if (!dailyResults.allTime[date]) {
        dailyResults.allTime[date] = {
          people: 0,
          amount: 0,
          tax: 0
        };
      }
      dailyResults.allTime[date].people += parseInt(cells[peopleIndex].replace(/"/g, ''), 10);
      dailyResults.allTime[date].amount += parseInt(cells[amountIndex].replace(/"/g, ''), 10);
      dailyResults.allTime[date].tax += parseInt(cells[taxIndex].replace(/"/g, ''), 10);

      // 曜日別集計
      if (!weeklyResults.allTime[weekday]) {
        weeklyResults.allTime[weekday] = {
          people: 0,
          amount: 0,
          tax: 0
        };
      }
      weeklyResults.allTime[weekday].people += parseInt(cells[peopleIndex].replace(/"/g, ''), 10);
      weeklyResults.allTime[weekday].amount += parseInt(cells[amountIndex].replace(/"/g, ''), 10);
      weeklyResults.allTime[weekday].tax += parseInt(cells[taxIndex].replace(/"/g, ''), 10);

      if (time >= startTime && time <= endTime) {
        // 日別集計
        if (!dailyResults.rangeTime[date]) {
          dailyResults.rangeTime[date] = {
            people: 0,
            amount: 0,
            tax: 0
          };
        }
        dailyResults.rangeTime[date].people += parseInt(cells[peopleIndex].replace(/"/g, ''), 10);
        dailyResults.rangeTime[date].amount += parseInt(cells[amountIndex].replace(/"/g, ''), 10);
        dailyResults.rangeTime[date].tax += parseInt(cells[taxIndex].replace(/"/g, ''), 10);

        // 曜日別集計
        if (!weeklyResults.rangeTime[weekday]) {
          weeklyResults.rangeTime[weekday] = {
            people: 0,
            amount: 0,
            tax: 0
          };
        }
        weeklyResults.rangeTime[weekday].people += parseInt(cells[peopleIndex].replace(/"/g, ''), 10);
        weeklyResults.rangeTime[weekday].amount += parseInt(cells[amountIndex].replace(/"/g, ''), 10);
        weeklyResults.rangeTime[weekday].tax += parseInt(cells[taxIndex].replace(/"/g, ''), 10);
      }
    }

    displayResults(dailyResults, weeklyResults, firstDate, lastDate, startTime, endTime);
  };

  reader.readAsArrayBuffer(file);
}

function displayResults(dailyResults, weeklyResults, firstDate, lastDate, startTime, endTime) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = "";

  // 日付範囲の表示
  let dateRangeHTML = `
    <h5>集計日にち範囲: ${firstDate} 〜 ${lastDate}</h5>
    <h5>範囲指定時間: ${startTime} 〜 ${endTime}</h5>
  `;

  // 日別の結果をテーブルに表示
  let tableHTML = `
      <h5>日別集計</h5>
        <table class="highlight responsive-table">
            <thead>
                <tr>
                    <th>日付</th>
                    <th>人数</th>
                    <th>税抜計</th>
                    <th>合計</th>
                    <th>内税計</th>
                    <th>人数(終日)</th>
                    <th>税抜計(終日)</th>
                    <th>合計(終日)</th>
                    <th>内税計(終日)</th>
                </tr>
            </thead>
            <tbody>
    `;

  for (const date in dailyResults.rangeTime) {
    tableHTML += `
            <tr>
            <td>${date}</td>
            <td>${dailyResults.rangeTime[date].people}</td>
            <td>${dailyResults.rangeTime[date].amount - dailyResults.rangeTime[date].tax}円</td>
            <td>${dailyResults.rangeTime[date].amount}円</td>
            <td>${dailyResults.rangeTime[date].tax}円</td>
            <td>${dailyResults.allTime[date].people}</td>
            <td>${dailyResults.allTime[date].amount - dailyResults.allTime[date].tax}円</td>
            <td>${dailyResults.allTime[date].amount}円</td>
            <td>${dailyResults.allTime[date].tax}円</td>
            </tr>
        `;
  }

  tableHTML += `
            </tbody>
        </table>
    `;

  // 曜日別の結果をテーブルに表示
  tableHTML += `
        <h5>曜日別集計</h5>
        <table class="highlight responsive-table">
            <thead>
                <tr>
                    <th>曜日</th>
                    <th>人数</th>
                    <th>税抜計</th>
                    <th>合計</th>
                    <th>内税計</th>
                    <th>人数(終日)</th>
                    <th>税抜計(終日)</th>
                    <th>合計(終日)</th>
                    <th>内税計(終日)</th>
                </tr>
            </thead>
            <tbody>
    `;

  for (const weekday in weeklyResults.rangeTime) {
    tableHTML += `
          <tr>
              <td>${weekday}</td>
              <td>${weeklyResults.rangeTime[weekday].people}</td>
              <td>${weeklyResults.rangeTime[weekday].amount - weeklyResults.rangeTime[weekday].tax}円</td>
              <td>${weeklyResults.rangeTime[weekday].amount}円</td>
              <td>${weeklyResults.rangeTime[weekday].tax}円</td>
              <td>${weeklyResults.allTime[weekday].people}</td>
              <td>${weeklyResults.allTime[weekday].amount - weeklyResults.allTime[weekday].tax}円</td>
              <td>${weeklyResults.allTime[weekday].amount}円</td>
              <td>${weeklyResults.allTime[weekday].tax}円</td>
          </tr>
      `;
  }

  tableHTML += `
            </tbody>
        </table>
    `;

  resultDiv.innerHTML = dateRangeHTML + tableHTML;
}