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

        let results = {};

        for (let i = 1; i < lines.length; i++) {
            const cells = lines[i].split(',');
            if (cells == "") {
                break;
            }

            const dateTime = new Date(cells[dateIndex].replace(/"/g, ''));
            const date = dateTime.toISOString().split('T')[0];
            const time = dateTime.toTimeString().split(' ')[0];

            if (time >= startTime && time <= endTime) {
                if (!results[date]) {
                    results[date] = {
                        people: 0,
                        amount: 0,
                        tax: 0
                    };
                }

                results[date].people += parseInt(cells[peopleIndex].replace(/"/g, ''), 10);
                results[date].amount += parseInt(cells[amountIndex].replace(/"/g, ''), 10);
                results[date].tax += parseInt(cells[taxIndex].replace(/"/g, ''), 10);
            }
        }

        displayResults(results);
    };

    reader.readAsArrayBuffer(file);
}

function displayResults(results) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = "";

    // テーブルヘッダー
    let tableHTML = `
        <table class="highlight responsive-table">
            <thead>
                <tr>
                    <th>日付</th>
                    <th>人数</th>
                    <th>税抜計</th>
                    <th>合計</th>
                    <th>内税計</th>
                </tr>
            </thead>
            <tbody>
    `;

    // テーブルデータ
    for (const date in results) {
        tableHTML += `
            <tr>
                <td>${date}</td>
                <td>${results[date].people}</td>
                <td>${results[date].amount - results[date].tax}円</td>
                <td>${results[date].amount}円</td>
                <td>${results[date].tax}円</td>
            </tr>
        `;
    }

    // テーブルフッター
    tableHTML += `
            </tbody>
        </table>
    `;

    resultDiv.innerHTML = tableHTML;
}
