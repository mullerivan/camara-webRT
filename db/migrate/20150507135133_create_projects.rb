class CreateProjects < ActiveRecord::Migration
  def change
    create_table :projects do |t|
      t.string :name
      t.text :description
      t.date :date
      t.string :place

      t.timestamps null: false
    end
  end
end
