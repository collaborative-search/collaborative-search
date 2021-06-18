import runner
import KUSH

input_text = open("input.txt","r").read() 

summary = runner.runner(input_text)

print(summary)