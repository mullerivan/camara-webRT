class CreateSnapshots < ActiveRecord::Migration
  def change
    create_table :snapshots do |t|
      t.string :name
      t.text :description
      t.references :video, index: true, foreign_key: true
      t.string :file

      t.timestamps null: false
    end
  end
end
