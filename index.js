document.addEventListener('DOMContentLoaded', () => {
    const pieces = document.querySelectorAll('.puzzle-piece');
    const slots = document.querySelectorAll('.puzzle-slot');
    const generateBtn = document.getElementById('generateBtn');
    const responseDiv = document.getElementById('apiResponse');

    let placedPieces = {};

    pieces.forEach(piece => {
        piece.addEventListener('dragstart', e => {
            e.dataTransfer.setData('color', piece.dataset.color);
            e.dataTransfer.setData('id', piece.id);
            console.log(`Dragging piece: ${piece.id}`); // Debug log
        });
    });

    slots.forEach(slot => {
        slot.addEventListener('dragover', e => e.preventDefault());

        slot.addEventListener('drop', e => {
            e.preventDefault();
            const draggedColor = e.dataTransfer.getData('color');
            const draggedPieceId = e.dataTransfer.getData('id');
            const draggedPiece = document.getElementById(draggedPieceId);

            if (slot.dataset.slot === draggedColor) {
                const existingPiece = placedPieces[draggedColor];
                if (existingPiece) {
                    const sidebar = document.querySelector('.sidebar');
                    sidebar.appendChild(existingPiece);
                    existingPiece.style.display = 'block';
                }

                slot.textContent = draggedPiece.textContent;
                slot.style.color = 'white';
                slot.style.backgroundColor = draggedColor;
                draggedPiece.style.display = 'none';
                placedPieces[draggedColor] = draggedPiece;
                console.log(`Placed piece: ${draggedPieceId} in slot: ${slot.dataset.slot}`); // Debug log
            } else {
                alert('You can only place the piece in the slot with the matching color!');
            }
        });
    });

    generateBtn.addEventListener('click', get_sentence);

    async function get_sentence() {
        const slot1 = document.querySelector('.puzzle-slot[data-slot="red"]').textContent.trim();
        const slot2 = document.querySelector('.puzzle-slot[data-slot="green"]').textContent.trim();
        const slot3 = document.querySelector('.puzzle-slot[data-slot="blue"]').textContent.trim();

        const sentence = `${slot1} ${slot2} ${slot3}`;

        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({sentence}),
        });

        const result = await response.json();
        if (result.status === "success") {
            const cleanedResponse = result.response.replace(/```html|```/g, ''); // Remove ```html and ```
            responseDiv.innerHTML = cleanedResponse;
        } else {
            responseDiv.textContent = "Error: " + result.message;
        }
    }
});
