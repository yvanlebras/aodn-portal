databaseChangeLog = {

	changeSet(author: "pmak (generated)", id: "1339985518682-1") {
		addColumn(tableName: "server") {
			column(name: "password", type: "varchar(255)")
		}
	}

	changeSet(author: "pmak (generated)", id: "1339985518682-2") {
		addColumn(tableName: "server") {
			column(name: "username", type: "varchar(255)")
		}
	}
}
