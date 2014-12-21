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


System Resource Demo
--------------------
Installation:
* pip install psutil
* cp resource_linegraph.cfg linegraph.cfg
Execute: python resouce_demo.py

This demo reads the system CPU, memory and disk usage percentages and
displays the results as a percentage on a line graph.  The library
used should work on Linux, Mac and Windows platforms.
"""

import datetime
import os
import shutil
import time

import psutil


def run():
    psutil.cpu_percent()  # Needs an initialization
    print("Cleaing up old linegraph data...")
    try:
        os.remove("linegraph.tsv")
    except Exception:
        pass
    time.sleep(2)
    shutil.copy2("linegraph.cfg", "linegraph.del")
    print("Starting resource monitoring...")
    while True:
        timestamp = "{}".format(datetime.datetime.utcnow())[:-7]
        cpu_percent = psutil.cpu_percent()
        virt_mem_data = psutil.virtual_memory()
        virt_mem_percent = virt_mem_data.percent
        disk_data = psutil.disk_usage('/')
        disk_percent = disk_data.percent
        print("{} - CPU: {}%, Memory: {}%, Disk Used: {}%".format(
            timestamp, cpu_percent, virt_mem_percent, disk_percent))
        out_str = "date\tfloat0\tfloat1\tfloat2\n"
        out_str += "{}\t{}\t{}\t{}\n".format(
            timestamp, cpu_percent, virt_mem_percent, disk_percent)
        fptr = open("linegraph.tsv", "w")
        fptr.write(out_str)
        fptr.close()
        time.sleep(5)


if __name__ == "__main__":
	print("Resource utilization demo beginning...")
	run()
	print("Resource utilization demo finished.")