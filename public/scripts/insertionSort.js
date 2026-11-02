

function insertionSort(data) {
    const a = [...data];

    for (let i = 1; i < a.length; i++) {
        const [y,m,d] = a[i].date.split("-");
        const key = parseInt(y+m+d);
        let j = i - 1;

        while (j >= 0 && a[j] > key) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;
    }
    return a
}

