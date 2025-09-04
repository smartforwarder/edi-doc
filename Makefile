pdf:
	pandoc -o edi.pdf ./README.md --pdf-engine=/Library/TeX/texbin/pdflatex

shipment:
	pandoc -o shipments.pdf ./shipments.md --pdf-engine=/Library/TeX/texbin/pdflatex

install:
	brew install pandoc
	brew install basictex
