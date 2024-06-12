class GameOfLife {
	constructor(cols, rows, squareSize) {
		this.cols = cols;
		this.rows = rows;
		this.squareSize = squareSize;
		this.currentGeneration = 1;
		this.grid = this.make2DArray(this.cols, this.rows);
		this.history = [this.grid];
		this.populationData = [];
		this.isDrawing = false;

		this.canvas = document.getElementById("canvas");
		this.ctx = this.canvas.getContext("2d");
		this.nextBtn = document.getElementById("next");
		this.prevBtn = document.getElementById("prev");
		this.resetBtn = document.getElementById("reset");
		this.applySettingsBtn = document.getElementById("applySettings");
		this.genP = document.getElementById("generation");
		this.popP = document.getElementById("population");
		this.drawModeBtn = document.getElementById("drawMode");

		this.dx = [-1, 0, 1, -1, 1, -1, 0, 1];
		this.dy = [-1, -1, -1, 0, 0, 1, 1, 1];

		this.lineChart = null;
		this.isDrawMode = false;

		this.setup();
		this.addEventListeners();
	}

	make2DArray(cols, rows, defaultValue = 1) {
		let arr = new Array(rows);
		for (let i = 0; i < rows; i++) {
			arr[i] = new Array(cols);
			for (let j = 0; j < cols; j++) {
				arr[i][j] = defaultValue == 0 ? 0 : Math.round(Math.random());
			}
		}
		return arr;
	}

	addEventListeners() {
		document.addEventListener("keydown", (event) => {
			if (event.key === "r" || event.key === "R") {
				this.setup();
			} else if (event.key === "ArrowRight") {
				this.update();
			} else if (event.key === "ArrowLeft") {
				this.previousGeneration();
			}
		});

		this.resetBtn.addEventListener("click", () => {
			this.setup();
		});

		this.nextBtn.addEventListener("click", () => {
			this.update();
		});

		this.prevBtn.addEventListener("click", () => {
			this.previousGeneration();
		});

		document.addEventListener("wheel", (event) => {
			if (event.deltaY < 0) {
				this.update(); // Wheel up
			} else {
				this.previousGeneration(); // Wheel down
			}
		});

		this.applySettingsBtn.addEventListener("click", () => {
			const newWidth = parseInt(document.getElementById("width").value);
			const newHeight = parseInt(document.getElementById("height").value);
			const newSize = parseInt(document.getElementById("cellSize").value);
			this.updateSettings(newWidth, newHeight, newSize);
		});

		const jumpBtn = document.getElementById("jumpBtn");
		jumpBtn.addEventListener("click", () => {
			const generation = parseInt(
				document.getElementById("jumpToGen").value
			);
			this.jumpToGeneration(generation);
		});

		this.drawModeBtn.addEventListener("click", () => {
			this.isDrawMode = !this.isDrawMode;
			this.drawModeBtn.innerHTML = this.isDrawMode
				? "Disable Draw Mode"
				: "Enable Draw Mode";
			if (this.isDrawMode) {
				this.grid = this.make2DArray(this.cols, this.rows, 0);
			} else {
				this.grid = this.make2DArray(this.cols, this.rows);
			}
			this.currentGeneration = 1;
			this.history = [this.grid];
			this.createPopulationChart();
			this.draw();
		});

		this.canvas.addEventListener("mousedown", (event) => {
			if (this.isDrawMode) {
				this.isDrawing = true;
				this.drawCell(event);
			}
		});

		this.canvas.addEventListener("mousemove", (event) => {
			if (this.isDrawing && this.isDrawMode) {
				this.drawCell(event);
			}
		});

		this.canvas.addEventListener("mouseup", () => {
			this.isDrawing = false;
		});

		this.canvas.addEventListener("mouseleave", () => {
			this.isDrawing = false;
		});
	}

	drawCell(event) {
		const rect = this.canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		const col = Math.floor(x / this.squareSize);
		const row = Math.floor(y / this.squareSize);

		if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
			this.grid[row][col] = 1; // Make the cell alive
			this.populationData.pop();
			this.populationData.push(
				this.calculatePopulationPercentage(this.grid)
			);
			this.draw();
			this.updateChart();
		}
	}

	jumpToGeneration(generation) {
		if (
			generation < 0 ||
			Math.abs(generation - this.currentGeneration) > 1000
		) {
			alert(
				"Invalid generation number or jump difference exceeds 1000 steps"
			);
			return;
		}

		// Check if the requested generation is already in the history
		if (generation < this.history.length) {
			this.currentGeneration = generation;
			this.grid = this.history[generation];
			this.draw();
			return;
		}

		// If not, determine whether to move forward or backward
		if (generation < this.currentGeneration) {
			while (this.currentGeneration > generation) {
				this.previousGeneration();
			}
		} else {
			this.grid = this.history[this.history.length - 1];
			this.currentGeneration = this.history.length;
			while (this.currentGeneration < generation) {
				this.update();
			}
		}
	}

	setup() {
		this.grid = this.make2DArray(this.cols, this.rows);
		this.canvas.width = this.cols * this.squareSize;
		this.canvas.height = this.rows * this.squareSize;
		this.currentGeneration = 1;
		this.history = [this.grid];
		this.createPopulationChart();
		this.draw();
	}

	update() {
		if (this.history.length > this.currentGeneration + 1) {
			this.grid = this.history[this.currentGeneration];
		} else {
			this.grid = this.nextGen(this.grid);
			this.history.push(this.grid);
			this.populationData.push(
				this.calculatePopulationPercentage(this.grid)
			);
		}
		this.currentGeneration++;
		this.draw();
	}

	previousGeneration() {
		if (this.currentGeneration > 1) {
			this.currentGeneration--;
			this.grid = this.history[this.currentGeneration - 1];
			this.draw();
		}
	}

	nextGen(arr) {
		let res = this.make2DArray(this.cols, this.rows);
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				if (arr[i][j] == 1) {
					res[i][j] =
						this.getValue(arr, i, j) == 2 ||
						this.getValue(arr, i, j) == 3
							? 1
							: 0;
				} else {
					res[i][j] = this.getValue(arr, i, j) == 3 ? 1 : 0;
				}
			}
		}
		return res;
	}

	getValue(arr, i, j) {
		let cnt = 0;
		for (let k = 0; k < 8; k++) {
			let nx = i + this.dx[k];
			let ny = j + this.dy[k];
			if (nx >= 0 && ny >= 0 && nx < this.rows && ny < this.cols) {
				cnt += arr[nx][ny];
			}
		}
		return cnt;
	}

	getColor(value) {
		return value == 0 ? "black" : "white";
	}

	draw() {
		let cnt = 0;
		for (let i = 0; i < this.grid.length; i++) {
			for (let j = 0; j < this.grid[i].length; j++) {
				const value = this.grid[i][j];
				cnt += value;
				const color = this.getColor(value);
				this.ctx.fillStyle = color;
				this.ctx.fillRect(
					j * this.squareSize,
					i * this.squareSize,
					this.squareSize,
					this.squareSize
				);
			}
		}
		this.genP.innerHTML = `Generation: ${this.currentGeneration}`;
		this.popP.innerHTML = `Population: ${cnt}/${this.cols * this.rows} (${(
			(cnt * 100) /
			this.cols /
			this.rows
		).toFixed(2)}%)`;
		this.updateChart();
	}

	updateSettings(newCols, newRows, newSquareSize) {
		this.cols = newCols;
		this.rows = newRows;
		this.squareSize = newSquareSize;
		this.setup();
	}

	calculatePopulationPercentage(grid) {
		let totalCells = grid.length * this.grid[0].length;
		let populationCount = 0;
		for (let i = 0; i < grid.length; i++) {
			for (let j = 0; j < grid[i].length; j++) {
				// populationCount += this.grid[i][j];
				const value = grid[i][j];
				populationCount += value;
			}
		}
		return ((populationCount / totalCells) * 100).toFixed(2);
	}

	createPopulationChart() {
		const ctx = document
			.getElementById("population-chart")
			.getContext("2d");
		if (this.lineChart) this.lineChart.destroy();
		this.lineChart = new Chart(ctx, {
			type: "line",
			data: {
				labels: Array.from(
					{ length: this.populationData.length },
					(_, i) => i + 1
				), // Assuming x-axis labels are from 1 to the length of data
				datasets: [
					{
						label: "Percentage of population",
						data: this.populationData,
						borderColor: "rgb(75, 192, 192)",
						tension: 0.1,
					},
				],
			},
			options: {
				animation: false,
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							callback: function (value, index, values) {
								return value + "%";
							},
						},
					},
				},
			},
		});
		this.populationData = []
		this.populationData.push(this.calculatePopulationPercentage(this.grid));
	}

	updateChart() {
		var newData = this.populationData.slice(0, this.currentGeneration);
		this.lineChart.data.labels = Array.from(
			{ length: newData.length },
			(_, i) => i + 1
		);
		this.lineChart.data.datasets[0].data = newData;
		this.lineChart.update();
	}
}

// Initialize the game with default settings from HTML inputs
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const cellSizeInput = document.getElementById("cellSize");

const initialWidth = parseInt(widthInput.value);
const initialHeight = parseInt(heightInput.value);
const initialCellSize = parseInt(cellSizeInput.value);

const game = new GameOfLife(initialWidth, initialHeight, initialCellSize);
