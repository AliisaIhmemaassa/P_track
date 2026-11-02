
function insertionSort(list) {
    const a = [...list];

    for (let i = 1; i < a.length; i++) {
        const item = a[i];
        let j = i - 1;

        // ISO dates (YYYY-MM-DD) compare correctly as plain strings
        while (j >= 0 && a[j].date > item.date) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = item;
    }
    return a;
}