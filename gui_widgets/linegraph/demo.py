"""
Copyright 2014 Paul Montgomery

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


Linegraph Demo
--------------
Execute: python demo.py

This demo program generates some random 3 line linegraph data in .TSV
format for the month of May 2014 with 5 second sleeps in between each
new data set.  This enables a quick realtime linegraph visualization.
"""

import os
from random import randint
import shutil
import time


def run():
	print("Cleaing up old linegraph data...")
	try:
		os.remove("linegraph.tsv")
	except Exception:
		pass
	time.sleep(2)
	shutil.copy2("linegraph.cfg", "linegraph.del")
	print("Starting data generation...")
	for counter in range(1, 30):
		out_str = "date\tclose0\tclose1\tclose2\n"
		time.sleep(5)
		print("{}-May-14".format(counter))
		close0 = randint(100, 1000);
		close1 = randint(100, 1000);
		close2 = randint(100, 1000);
		out_str += "{}-May-14\t{}\t{}\t{}\n".format(counter, close0, close1, close2)
		fptr = open("linegraph.tsv", "w")
		fptr.write(out_str)
		fptr.close()

if __name__ == "__main__":
	print("Linegraph demo beginning...")
	run()
	print("Linegraph demo finished.")