#
# Insipred by the Bootstrap's Makefile
#
DATE=$(shell date +%I:%M%p)
CHECK=\033[32m✔\033[39m

all: build utilities lightshow classes success

build: src/*.js
	@echo "Build attempt started at: ${DATE}"
	@mkdir -p build

utilities: src/utilities.js
	@echo "Setting up utilities..."
	@cat src/utilities.js > build/ls.js
	@echo "Done: utilities ${CHECK}"

lightshow: src/lightshow.js
	@echo "Setting up lightshow interface..."
	@cat src/lightshow.js >> build/ls.js
	@echo "Done: interface ${CHECK}"

classes: src/Particle.js src/AudioPlayer.js
	@echo "Setting up lightshow extras..."
	@cat src/Particle.js src/AudioPlayer.js src/Library.js >> build/ls.js
	@echo "Done: extras ${CHECK}"

success:
	@echo "All done!"

clean:
	rm -r build