document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
    const dropZoneElement = inputElement.parentNode.querySelector(".drop-zone");
    const prompt = inputElement.parentNode.querySelector(".drop-zone__prompt");

    prompt.addEventListener("click", (_) => {
        inputElement.click();
    });

    inputElement.addEventListener("change", (_) => {
        if (inputElement.files.length) {
            prompt.textContent = inputElement.files.map(v => v.name).join(', ');
        }
    });

    dropZoneElement.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZoneElement.focus();
    });

    ["dragleave", "dragend"].forEach((type) => {
        dropZoneElement.addEventListener(type, (_) => {
            dropZoneElement.blur();
        });
    });

    dropZoneElement.addEventListener("drop", (e) => {
        e.preventDefault();
        const dT = new DataTransfer();
        let names = [];
        for (const f of e.dataTransfer.files) {
            dT.items.add(f);
            names.push(f.name);
        }
        inputElement.files = dT.files;
        if (inputElement.files.length) {
            prompt.textContent = names.join(', ');
        }
    });
});

